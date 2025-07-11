import multer from "multer";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "./public/temp")
    },
    filename: function (req, file, cb) {
      
      cb(null, file.originalname)                // ye bna tha avatar aur cverimage ke liye 
    }
  })
  
export const upload = multer({ 
    storage, 
})