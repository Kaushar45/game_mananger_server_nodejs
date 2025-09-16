import multer from "multer";
import { ServerError } from "../error.mjs";

const uploadConfig = {
  maxFileSize: 2 * 1024 * 1024,
  allowedMimeTypes: ["image/jpeg", "image/png"],
  allowedExtensions: [".jpg", ".jpeg", ".png"],
  destination: "./uploads/",
};

// Memory storage (keeps files in RAM as Buffer)
const storage = multer.memoryStorage();

// File filter for images only
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: uploadConfig.maxFileSize,
    files: 1,
  },
  fileFilter: fileFilter,
});

const singleImageUpload = (fieldName = "image") => {
  return async (req, res, next) => {
    const singleUpload = upload.single(fieldName);

    singleUpload(req, res, (error) => {
      if (error) {
        if (error instanceof multer.MulterError) {
          switch (error.code) {
            case "LIMIT_FILE_SIZE":
              return next(
                new ServerError(
                  400,
                  `File size must be less than ${
                    uploadConfig.maxFileSize / (1024 * 1024)
                  }MB`
                )
              );

            case "LIMIT_FILE_COUNT":
              return next(new ServerError(400, `Only one file is allowed`));

            case "LIMIT_UNEXPECTED_FILE":
              return next(
                new ServerError(400, `Expected field name: ${fieldName}`)
              );

            default:
              console.log(error);
              return next(new ServerError(400, error.message));
          }
        }
        // Handle other errors
        return next(new ServerError(400, error.message));
      }

      // Check if file was uploaded
      if (!req.file) {
        return next(new ServerError(400, "Please select a file to upload"));
      }

      // Add file info to request object for further processing
      req.uploadedFile = {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        path: req.file.path,
      };

      next();
    });
  };
};

export { singleImageUpload };
