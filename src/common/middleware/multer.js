import multer from 'multer';
import path from 'path';
export const storage = multer.diskStorage({
    dest: 'uploads/profiles/',
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, Date.now() + ext);
    }
})
export const upload=multer({storage})