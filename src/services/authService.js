// ========================================
// Google OAuth Service (for Gemini API)
// ========================================

const AuthService = {
    clientId: null,
    isSignedIn: false,
    userProfile: null,
    accessToken: null,

    init() {
        this.clientId = localStorage.getItem('google_client_id') || null;
    },

    setClientId(id) {
        this.clientId = id;
        localStorage.setItem('google_client_id', id);
    },

    getClientId() {
        return this.clientId;
    },

    async signIn() {
        // Google OAuth removed as per requirements
        return { success: false, error: 'Google Sign-In is disabled.' };
    },

    signOut() {
        this.accessToken = null;
        this.isSignedIn = false;
        this.userProfile = null;
    },

    getToken() {
        return null;
    },

    getStatus() {
        return {
            isSignedIn: this.isSignedIn,
            hasClientId: !!this.clientId,
            profile: this.userProfile
        };
    }
};

AuthService.init();

export default AuthService;
