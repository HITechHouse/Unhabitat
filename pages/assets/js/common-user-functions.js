/**
 * Common User Functions
 * Functions used across multiple pages for user management
 */

// Global variables
let currentUserProfile = null;

// API Configuration
const API_BASE_URL = "http://127.0.0.1:8000";

/**
 * Get JWT token from localStorage
 */
function getAuthToken() {
  return localStorage.getItem("access_token");
}

/**
 * Check if user is authenticated
 */
function isAuthenticated() {
  const token = getAuthToken();
  return token !== null && token !== undefined && token !== "";
}

/**
 * API Helper function
 */
async function apiCall(endpoint, options = {}) {
  const token = getAuthToken();
  const defaultHeaders = {
    "Content-Type": "application/json",
  };

  if (token) {
    defaultHeaders["Authorization"] = `Bearer ${token}`;
  }

  const config = {
    headers: defaultHeaders,
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    if (!response.ok) {
      if (response.status === 401) {
        console.warn("Authentication failed, redirecting to login...");
        setTimeout(() => {
          window.location.href = "./index.html";
        }, 1000);
        return null;
      }

      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.detail ||
          errorData.message ||
          `HTTP error! status: ${response.status}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("API call failed:", error);
    throw error;
  }
}

/**
 * Load user profile and update header
 */
async function loadUserProfileForHeader() {
  try {
    // Skip if not authenticated
    if (!isAuthenticated()) {
      console.log("User not authenticated, skipping profile load");
      return null;
    }

    const userData = await apiCall("/auth/profile/");
    if (userData && userData.user) {
      currentUserProfile = userData.user;
      updateHeaderProfileImage(currentUserProfile);
      return currentUserProfile;
    }
  } catch (error) {
    console.error("Error loading user profile for header:", error);
    // Don't redirect on error, just use default image
    return null;
  }
}

/**
 * Load user permissions and store in localStorage
 */
async function loadUserPermissions() {
  try {
    // Skip if not authenticated
    if (!isAuthenticated()) {
      console.log("User not authenticated, skipping permissions load");
      return null;
    }

    const userData = await apiCall("/auth/profile/");
    if (userData && userData.permissions) {
      // Store permissions in localStorage
      localStorage.setItem(
        "userPermissions",
        JSON.stringify(userData.permissions)
      );
      console.log("User permissions loaded and stored:", userData.permissions);
      return userData.permissions;
    }
  } catch (error) {
    console.error("Error loading user permissions:", error);
    return null;
  }
}

/**
 * Get user permissions from localStorage
 */
function getUserPermissions() {
  try {
    const permissions = localStorage.getItem("userPermissions");
    return permissions ? JSON.parse(permissions) : [];
  } catch (error) {
    console.error("Error parsing user permissions from localStorage:", error);
    return [];
  }
}

/**
 * Check if user has specific permission
 */
function hasPermission(permissionCode) {
  const permissions = getUserPermissions();
  return permissions.some((perm) => perm.code === permissionCode);
}

/**
 * Check if user has access to specific page
 */
function hasPageAccess(pageUrl) {
  const permissions = getUserPermissions();
  return permissions.some((perm) => perm.page === pageUrl);
}

/**
 * Update profile image in header
 */
function updateHeaderProfileImage(user) {
  const menuToggleBtn = document.getElementById("menuToggleBtn");
  if (menuToggleBtn && user) {
    let profileImageUrl = "/media/profiles/default.png"; // Default fallback

    // Use user's profile picture if available
    if (user.profile_picture_url) {
      profileImageUrl = user.profile_picture_url;
    }

    // Update button background image
    menuToggleBtn.style.backgroundImage = `url('${profileImageUrl}')`;
    menuToggleBtn.style.backgroundSize = "cover";
    menuToggleBtn.style.backgroundPosition = "center";

    console.log(`Updated header profile image to: ${profileImageUrl}`);
  } else if (menuToggleBtn) {
    // Fallback to default image if no user data
    menuToggleBtn.style.backgroundImage = `url('/media/profiles/default.png')`;
    menuToggleBtn.style.backgroundSize = "cover";
    menuToggleBtn.style.backgroundPosition = "center";

    console.log("Updated header profile image to default");
  }
}

/**
 * Initialize header user profile (call this on page load)
 */
function initializeHeaderProfile() {
  // Load user profile and update header
  loadUserProfileForHeader();
}

/**
 * Initialize user permissions (call this after login)
 */
async function initializeUserPermissions() {
  return await loadUserPermissions();
}

/**
 * Refresh header profile image (call after profile update)
 */
async function refreshHeaderProfile() {
  return await loadUserProfileForHeader();
}

// Auto-initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  // Small delay to ensure other scripts have loaded
  setTimeout(() => {
    initializeHeaderProfile();
  }, 100);
});

// Export functions and constants for use in other scripts
window.API_BASE_URL = API_BASE_URL;
window.userFunctions = {
  getAuthToken,
  isAuthenticated,
  apiCall,
  loadUserProfileForHeader,
  loadUserPermissions,
  getUserPermissions,
  hasPermission,
  hasPageAccess,
  updateHeaderProfileImage,
  initializeHeaderProfile,
  initializeUserPermissions,
  refreshHeaderProfile,
  currentUserProfile: () => currentUserProfile,
};

/**
 * Logout user and redirect to login page
 */
async function logoutUser() {
  try {
    // Show loading notification
    if (typeof showNotification === "function") {
      showNotification("جاري تسجيل الخروج...", "info");
    }

    // Call logout API if available
    const token = getAuthToken();
    if (token) {
      try {
        await apiCall("/auth/logout/", {
          method: "POST",
        });
      } catch (error) {
        console.warn("Logout API call failed:", error);
        // Continue with logout process even if API fails
      }
    }

    // Clear all stored data
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("userPermissions");
    localStorage.removeItem("userProfile");
    localStorage.removeItem("userNotifications");
    localStorage.removeItem("preferredLanguage");
    localStorage.removeItem("mapType");

    // Clear session storage
    sessionStorage.clear();

    // Show success notification
    if (typeof showNotification === "function") {
      showNotification("تم تسجيل الخروج بنجاح", "success");
    }

    // Redirect to login page after short delay
    setTimeout(() => {
      window.location.href = "./index.html";
    }, 1000);
  } catch (error) {
    console.error("Error during logout:", error);

    // Show error notification
    if (typeof showNotification === "function") {
      showNotification("حدث خطأ أثناء تسجيل الخروج", "error");
    }

    // Force redirect even on error
    setTimeout(() => {
      window.location.href = "./index.html";
    }, 2000);
  }
}

/**
 * Handle settings button click - redirect based on permissions
 */
function handleSettingsClick(event) {
  event.preventDefault();

  // Check if user has dashboard permission
  const permissions = getUserPermissions();
  const hasDashboard = permissions.some(
    (perm) => perm.code === "PERM_DASHBOARD"
  );

  if (hasDashboard) {
    window.location.href = "./profile.html";
  } else {
    window.location.href = "./profileUser.html";
  }
}

// Make the function available globally
window.handleSettingsClick = handleSettingsClick;

// Add notification to center (for use in other pages)
function addNotificationToCenter(message, type = "info") {
  try {
    const notifications = JSON.parse(
      localStorage.getItem("userNotifications") || "[]"
    );
    const newNotification = {
      id: Date.now() + Math.random(),
      message: message,
      type: type,
      timestamp: new Date().toISOString(),
      read: false,
    };

    notifications.unshift(newNotification);
    localStorage.setItem("userNotifications", JSON.stringify(notifications));

    console.log("Notification added to center:", message);
  } catch (error) {
    console.error("Error adding notification to center:", error);
  }
}

// Make the function available globally
window.addNotificationToCenter = addNotificationToCenter;

// Update notifications badge globally (for use in other pages)
function updateNotificationsBadgeGlobal() {
  try {
    const notifications = JSON.parse(
      localStorage.getItem("userNotifications") || "[]"
    );
    const unreadCount = notifications.filter((n) => !n.read).length;
    const badge = document.getElementById("notificationsBadge");

    if (badge) {
      if (unreadCount > 0) {
        badge.textContent = unreadCount > 99 ? "99+" : unreadCount;
        badge.style.display = "flex";
      } else {
        badge.style.display = "none";
      }
    }
  } catch (error) {
    console.error("Error updating notifications badge:", error);
  }
}

// Make the function available globally
window.updateNotificationsBadgeGlobal = updateNotificationsBadgeGlobal;
