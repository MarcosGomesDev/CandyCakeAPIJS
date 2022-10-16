const multer = require('multer')

module.exports = (multer({
    storage: multer.diskStorage({}),
    fileFilter: (_, file, callback) => {
        if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg') {
            callback(null, true)
        } else {
            callback(new Error('somente imagens com a extensão jpeg, jpg ou png'))
        }
    }
}))