import mongoose from "mongoose";
export const genderENUM = { male: 'male', female: 'female' }
export const roleEnum = { user: 'user', admin: 'admin' }
export const providerEnum = { system: 'system', google: 'google' }


const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        minLength: 2, maxLength: [20,
            'firstName max length is 20 char and you have entered {VALUE} ']
    },
    lastName: {
        type: String,
        required: true,
        minLength: 2, maxLength: [20,
            'firstName max length is 20 char and you have entered {VALUE} ']
    },
    password: {
        type: String,
        required:function (){
            this.provider === providerEnum.system ? true : false
        }
    }, 
    forgetPasswordOtp: String ,
    email: {
        type: String,
        required: true, 
        unique: true
    },
    phoneNumber: {
        type: String,
        required: function () {
            console.log({doc:this});
            
            this.provider === providerEnum.system ? true : false
        }
    },
    gender: {
        type: String,
        enum:{values: Object.values(genderENUM),message:`${Object.values(genderENUM)}`},
        default: genderENUM.male
    }, role: {
        type: String,
        enum: { values: Object.values(roleEnum), message: `${Object.values(roleEnum)}` }
        , default:roleEnum.user 
    },
    confirmEmail: {
        type: Date 
        
    },  provider: {
        type: String,
        enum: { values: Object.values(providerEnum), message: `${Object.values(roleEnum)}` }
        , default:providerEnum.system
    },oldPasswords:[String]
    , picture: {
        public_id: String,
        secure_url: String
    },
    coverImages: [{
        public_id: String,
        secure_url: String
    }],
    certificates:[String],
    confirmEmailOtp: { type: String },
    confirmEmailOtpTries: {
    type: Number,
    default: 0,
},
confirmEmailOtpCreatedAt: {
    type: Date,
    },
changeCredentialTime: Date, 
    deletedAt: Date,
deletedBy: {type:mongoose.Schema.Types.ObjectId ,ref:'user'}
,    restoredAt: Date,
restoredBy:{ type:mongoose.Schema.Types.ObjectId ,ref:'user'}
},
    {
        timestamps: true, 
        toJSON: {virtuals:true}, 
        toObject:{virtuals:true}
    })
userSchema.virtual('fullName')
    .set(function (value) {
    const [firstName, lastName] = value.split(' ') || []
    this.set({firstName , lastName})   
    })
    .get(function () {
    return `${this.firstName }  ${this.lastName}`
    })
userSchema.virtual('messages', {
    localField: '_id',
    foreignField: 'receiverId',
    ref:'Message'
})

    
export const userModel = mongoose.models.User || mongoose.model('User', userSchema)
userModel.syncIndexes()