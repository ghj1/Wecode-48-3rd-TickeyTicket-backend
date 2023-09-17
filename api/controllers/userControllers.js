const userService = require('../services/userServices')
const { catchAsync } = require('../utils/error')

const signUp = catchAsync(async (req, res) => {
    console.log(signUp)
  const { 
    userName,
    nickName,
    email,
    password 
} = req.body;
if (!userName || !nickName || !email || !password ) {
    const error = new Error("KEY_ERROR")
    error.statusCode = 400;

    throw error;
}
    
const createUser = await userService.signUp(
        userName,
        nickName,
        email,
        password
    );
    
    res.status(201).json({ message: "user is created", createUser});
});
    
const signIn = catchAsync(async (req,res) =>{
    const {email, password} = req.body;
    if(!email || !password){
        const error = new Error("KEY_ERROR")
        error.statusCode = 400;
    
        throw error;
    }
    const accessToken = await userService.signIn(email, password);


    res.status(200).json({accessToken});
})

module.exports = {
    signUp,
    signIn
}