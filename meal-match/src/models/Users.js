import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';


const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        trim: true,
        required : [true, 'Please provide a username'],
        maxlength: 32

    },
    email: {
        type: String,
        trim: true,
        required: [true, 'Please provide your email address'],
        unique: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
           'Please provide a valid email address'
        ]
    },
    password: {
        type: String,
        trim: true,
        required: [true, 'Please provide a password'],
        select: false,
        minlength: 6,
    },
    dietary_preferences: {type: String, required: false},
    allergies: {type: String, required: false},
}, {timestamps: true});

UserSchema.pre('save', async function(next){
    if (!this.isModified('password')){
        next()
    }
    this.password = await bcrypt.hash(this.password, 10);
});

UserSchema.methods.comparePassword = async function(password){
    return await bcrypt.compare(password, this.password);
}

UserSchema.methods.jwtGenerateToken = function(){
    return jwt.sign({id: this.id}, process.env.JWT_SECRET);
}


const User = mongoose.models.User || mongoose.model("User", UserSchema);

export default User;