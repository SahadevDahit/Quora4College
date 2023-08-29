import mongoose from "mongoose";
import bcrypt from 'bcryptjs'
const Schema = mongoose.Schema;

const UserShema = new Schema({
    userName: {
        type: String,
        required: true
    },
    authenticated: {
        type: Boolean,
        required: true,
        default: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    },
    phoneNumber: {
        type: String,
        required: true
    },
    dob: {
        type: Date
    },
 
});
UserShema.pre('save', async function (next) {
    try {
        const salt = await bcrypt.genSaltSync(10);
        const hashedPassword = await bcrypt.hash(this.password, salt);
        this.password = hashedPassword;
        next();

    } catch (err) {
        next(err);
    }
})

//compile the schema to model
const users = mongoose.model("users", UserShema);

export default users;