const bcrypt = require('bcrypt');
const { superBase } = require('../../configs/supabase');
const multer = require('multer');
const { Paramedics } = require('../../db/Paramedics');

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

      const { FullName, Email, country, location, degrees } = req.body;

      if (
        country === undefined ||
        location === undefined ||
        degrees === undefined ||
        FullName == undefined ||
        Email == undefined
      ) {
        return res.status(400).json({
          success: false,
          msg: 'country, location, degrees are required',
        });
      } else if (
        typeof country !== 'string' ||
        typeof location !== 'string' ||
        typeof degrees !== 'string' ||
        typeof FullName !== 'string' ||
        typeof Email !== 'String'
      ) {
        return res.status(400).json({
          error:
            'country, location, degrees, FullName,Email   must be a string',
        });
      } else if (country === '' || location === '' || degrees === '') {
        return res.status(400).json({
          success: false,
          msg: `country, location, degrees cant take an empty string value i.e ''`,
        });
      }

      try {
        const fileBuffer = req.file.buffer; // Get the image buffer
        const fileContentType = req.file.mimetype; // Get the image content type
        const originalFilename = req.file.originalname; // Get the original filename

        // Upload the image to Supabase storage with the correct content type and original filename
        const { data, error } = await superBase.storage
          .from('Form-data')
          .upload(originalFilename, fileBuffer, {
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

        const fileUrl = await superBase.storage
          .from('profile')
          .getPublicUrl(fileUrlPath);

        console.log(fileUrl);

        const paramedics = new Paramedics({
          country,
          location,
          degrees,
          resumeDocumentPath: fileUrl.data.publicUrl,
        });

        await paramedics.save();
        console.log('This new paramedics', paramedics);
        return res.json({
          msg: 'Paramedics created successfully',
          data: paramedics,
          success: true,
        });
      } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Server error' });
      }
    });
  } catch (error) {
    return res.status(500).json({ error: error });
  }
};
