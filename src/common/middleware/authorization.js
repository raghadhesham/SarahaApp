export const authorization = (roles) => {
    return (req, res, next) => { 
        console.log(req.user);
        
        if (!roles.includes(req.user.role)) {
            throw new Error("Unauthorized");
        }

        next();
    }
}
