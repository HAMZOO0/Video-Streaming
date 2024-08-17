import multer from "multer";

// storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp");
  },

  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

export const upload = multer({ storage: storage });

// * This setup ensures that when a file is uploaded to your server, multer will use the storage configuration to determine where to save the file (../../public/temp directory) and what name to give it (its original filename). This structure is fundamental for effectively managing file uploads within your application.

// cb(null, "../../public/temp");  --> ERROR
//when you start your application, the working directory of your Node.js process is typically the root directory from which you started the server. In your case, if you start your application from the backend directory, then backend is considered the root directory for path resolution.
