// import { createUploadthing } from "uploadthing/express";
// import z from "zod";
// import User from "../models/User.js";

// const f = createUploadthing();

// export const uploadRouter = {
//   imageUploader: f({
//     image: {
//       maxFileSize: "4MB",
//       maxFileCount: 1,
//     },
//   }).onUploadComplete((data) => {
//     console.log("upload completed", data);
//   }),

//   profileUploader: f({
//     image: {
//       maxFileSize: "4MB",
//       maxFileCount: 1,
//     },
//   })
//     .input(z.object({ user_id: z.string() }))
//     .middleware(({ input }) => {
//       return { input };
//     })
//     .onUploadComplete(async (data) => {
//       console.log("input", data.metadata.input);
//       const user = await User.findById(data.metadata.input.user_id);

//       if (user) {
//         user.profile = data.file.key;
//         await user.save();
//       }

//       console.log("profile upload completed", data.metadata);
//       return { file: data.file.key };
//     }),

//   FileUploader: f({
//     "application/pdf": { maxFileSize: "10MB" },
//     "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
//       maxFileSize: "10MB",
//     },
//     "application/vnd.openxmlformats-officedocument.presentationml.presentation":
//       {
//         maxFileSize: "10MB",
//       },
//     "application/xml": { maxFileSize: "5MB" },
//     "text/xml": { maxFileSize: "5MB" },
//     "image/png": { maxFileSize: "8MB" },
//     "image/jpeg": { maxFileSize: "8MB" },
//     "image/jpg": { maxFileSize: "8MB" },
//     "image/gif": { maxFileSize: "8MB" },
//     "image/webp": { maxFileSize: "8MB" },
//   }).onUploadComplete(async ({ file }) => {
//     console.log("Uploaded file:", file);

//     return {
//       fileUrl: file.url,
//     };
//   }),
// };

import { createUploadthing } from "uploadthing/express";
import z from "zod";
import User from "../models/User.js";

const f = createUploadthing();

export const uploadRouter = {
  imageUploader: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
  }).onUploadComplete((data) => {
    console.log("upload completed", data);
  }),

  profileUploader: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
  })
    .input(z.object({ user_id: z.string() }))
    .middleware(({ input }) => {
      return { input };
    })
    .onUploadComplete(async (data) => {
      console.log("input", data.metadata.input);
      const user = await User.findById(data.metadata.input.user_id);

      if (user) {
        user.profile = data.file.key;
        await user.save();
      }

      console.log("profile upload completed", data.metadata);
      return { file: data.file.key };
    }),

  receiptUploader: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 5,
    },
  }).onUploadComplete(async ({ file }) => {
    return {
      key: file.key,
      url: file.url,
      name: file.name,
    };
  }),
  FileUploader: f({
    "application/pdf": { maxFileSize: "10MB" },
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
      maxFileSize: "10MB",
    },
    "application/vnd.openxmlformats-officedocument.presentationml.presentation":
      {
        maxFileSize: "10MB",
      },
    "application/xml": { maxFileSize: "5MB" },
    "text/xml": { maxFileSize: "5MB" },
    "image/png": { maxFileSize: "8MB" },
    "image/jpeg": { maxFileSize: "8MB" },
    "image/jpg": { maxFileSize: "8MB" },
    "image/gif": { maxFileSize: "8MB" },
    "image/webp": { maxFileSize: "8MB" },
  }).onUploadComplete(async ({ file }) => {
    console.log("Uploaded file:", file);

    return {
      // fileUrl: file.url,
      url: file.ufsUrl || file.url,
      name: file.name,
      key: file.key,
    };
  }),
};
