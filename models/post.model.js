import mongoose from "mongoose";

const postSchema = mongoose.Schema({
  userId: {
    type:String,
    require:true,

  },

  content:{
    type:String,
    require:true,
  },

  title:{
   type:String,
   require:true,
   unique:true,
  },

  image:{
    type:String,
    default:'https://www.hostinger.com/tutorials/wp-content/uploads/sites/2/2021/05/how-to-add-a-new-post-in-wordpress.webp',
  },

  category:{
    type:String,
    require:true,
    default:'uncategorized',
  },
  slug:{
    type:String,
    require:true,
    unique:true,
  },
  

},
{ timestamps: true }
);

const Post  = mongoose.model('Post' , postSchema);
export default Post;

