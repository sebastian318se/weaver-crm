// Intercept calls and centralize clerk user id matching and stores current user
// Fetch from context -> get id from JWT -> call current user service

// HttpContext.User

// ↓

// Read "sub"

// ↓

// Find database user

// ↓

// Store CurrentUser

namespace TennisCrmApi.Authentication
{

}