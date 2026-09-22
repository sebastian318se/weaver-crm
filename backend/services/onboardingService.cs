using TennisCrmApi.Authentication;

namespace TennisCrmApi.Services
{
    public class OnboardingService
    {
        private readonly CurrentUserService _currentUser;

        public OnboardingService(CurrentUserService currentUser)
        {
            _currentUser = currentUser;
        }

        public bool Sync()
        {
            var clerkUserId = _currentUser.ClerkUserId;
            var clerkOrganizationId = _currentUser.ClerkOrganizationId;

            if (string.IsNullOrWhiteSpace(clerkUserId))
                return false;

            if (string.IsNullOrWhiteSpace(clerkOrganizationId))
                return false;

            return true;
        }
    }
}