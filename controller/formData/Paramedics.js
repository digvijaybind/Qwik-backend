const bcrypt = require("bcrypt");
const { superBase } = require('../../configs/supabase');
const multer = require('multer')
const {Paramedics} = require("../../db/Paramedics");
// const generateToken = require("../configs/jwtToken");
// const OperatorService = require("../services/operator-service");

const storage = multer.memoryStorage(); // Use memory storage for multer
const upload = multer({ storage: storage }).single('resume_docFilePath');

exports.RegisterParamedics = async (req, res, next) => {

  try {

    upload(req, res, async function (err) {
      if (err) {
        console.error(err);
        return res.status(400).json({ error: 'File upload failed' });
      }

      // Check if req.file contains the uploaded file information
      console.log(req.file);

      const {country, location,degrees } = req.body;
      if (!country && !location && !degrees) {
        return res.status(400).json({ error:'country,location and degrees field are required' });
      }

      try {
        const fileBuffer = req.file.buffer; // Get the image buffer
        const fileContentType = req.file.mimetype; // Get the image content type
        const originalFilename = req.file.originalname; // Get the original filename

        // Upload the image to Supabase storage with the correct content type and original filename
        const { data, error } = await superBase.storage.from('profile').upload(originalFilename, fileBuffer, {
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
         .from('profile')
         .getPublicUrl(fileUrlPath)
       
       console.log(fileUrl)

    
        const  paramedics= new Paramedics({
          country,
          location,
          degrees,
          resumeDocumentPath: fileUrl.data.publicUrl
        });

        
        await paramedics.save();
      console.log("This new Doctor",paramedics)
        return res.json({
          msg: 'Paramedics created successfully',
          data:paramedics,
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