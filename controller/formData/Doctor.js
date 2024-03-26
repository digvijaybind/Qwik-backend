const bcrypt = require("bcrypt");
const { superBase } = require('../../configs/supabase');
const multer = require('multer')
const {Doctor} = require("../../db/Doctor");
// const generateToken = require("../configs/jwtToken");
// const OperatorService = require("../services/operator-service");

const storage = multer.memoryStorage(); // Use memory storage for multer
const upload = multer({ storage: storage }).single('resume_docFilePath');

exports.RegisterDoctor = async (req, res, next) => {

  try {

    upload(req, res, async function (err) {
      if (err) {
        console.error(err);
        return res.status(400).json({ error: 'File upload failed' });
      }

      // Check if req.file contains the uploaded file information
      console.log(req.file);

      const { fullName,country,specialities, location,degrees } = req.body;
      if (!fullName && !country && !specialities && !location && !degrees) {
        return res.status(400).json({ error: 'fullName, country, specialities,location and degrees field are required' });
      }

      try {
        const fileBuffer = req.file.buffer; // Get the image buffer
        const fileContentType = req.file.mimetype; // Get the image content type
        const originalFilename = req.file.originalname; // Get the original filename

        // Upload the image to Supabase storage with the correct content type and original filename
        const { data, error } = await superBase.storage.from('Form-data').upload(originalFilename, fileBuffer, {
          cacheControl: '3600',
          upsert: false,
          contentType: fileContentType, // Use the content type from the uploaded file
        });

        if (error) {
          console.error(error);
          return res.status(500).json({ error: 'File upload failed' });
        }
        const fileUrlPath = data.path;
        console.log(fileUrlPath);
        

        if (!fileUrlPath) {
          return res.status(500).json({ error: 'File upload failed' });
        }
    
        const fileUrl= await superBase
         .storage
         .from('Form-data')
         .getPublicUrl(fileUrlPath)
       
       console.log(fileUrl)

    
        const doctor = new Doctor({
          fullName,
          country,
          specialities,
          location,
          degrees,
          visaDocumentPath: fileUrl.data.publicUrl
        });

        
        await doctor.save();
      console.log("This new Doctor",doctor)
        return res.json({
          msg: 'TeamMember created successfully',
          data:doctor,
          success: true,
        });

      } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Server error' });
      }
    });

    
  } catch (error) {
    throw new Error(error);
  }
};