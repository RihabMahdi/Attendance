import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';
import { addCourse } from '../../features/coursesFormateur/coursesFormateurSlice';
import jsPDF from 'jspdf';
import { getUserFromStorage } from '../../utils';

const AddCourse = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  console.log(getUserFromStorage('user'));

  const [newCourse, setNewCourse] = useState({
    coursequizID: '',
    courseName: '',
    teacherId: '',
    courseDescription: '',
    imageUrl: '', // Image will be stored as base64
    pdfUrl: '',
    videoLink: '',
    status: '',
    Module: '',
    contentOfCourse: [], // New array to hold chapters
  });

  const [pdfFile, setPdfFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [newChapter, setNewChapter] = useState({
    contentName: '',
    contentDescription: '',
  });

  // Handle input changes for text fields
  const handleInputChange = (e) => {
    const { name, value, files } = e.target;

    if (name === 'pdfUrl' && files[0]) {
      setPdfFile(files[0]); // Store file
    } else if (name === 'imageUrl' && files[0]) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = () => {
        setNewCourse({ ...newCourse, imageUrl: reader.result });
        setImagePreview(reader.result); // Display image preview
      };
      reader.readAsDataURL(file); // Convert image to base64
    } else {
      setNewCourse({ ...newCourse, [name]: value });
    }
  };

  // Handle the modal input changes
  const handleChapterInputChange = (e) => {
    const { name, value } = e.target;
    setNewChapter({ ...newChapter, [name]: value });
  };

  // Handle the modal submit
  const handleAddChapter = (e) => {
    e.preventDefault();
    const newChapterData = {
      contentId: (newCourse.contentOfCourse.length + 1).toString(),
      contentName: newChapter.contentName,
      contentDescription: newChapter.contentDescription,
    };
    setNewCourse((prevCourse) => ({
      ...prevCourse,
      contentOfCourse: [...prevCourse.contentOfCourse, newChapterData],
    }));
    setNewChapter({ contentName: '', contentDescription: '' }); // Clear the modal form
    setModalVisible(false); // Close the modal
  };

  // Handle form submission for course
  const handleSubmit = (e) => {
    e.preventDefault();

    const id = Math.random().toString(36).substring(2, 9);
    const updatedCourse = {
      ...newCourse,
      id,
      pdfUrl: pdfFile ? pdfFile.name : newCourse.pdfUrl,
      teacherName: getUserFromStorage('user').name,
    };

    dispatch(addCourse(updatedCourse));

    // Generate PDF with jsPDF (optional)
    const doc = new jsPDF();
    doc.text(`Module: ${newCourse.Module}`, 10, 10);
    doc.text(`courseName: ${newCourse.courseName}`, 10, 20);
    doc.text(`imageUrl: ${newCourse.imageUrl}`, 10, 30);
    if (pdfFile) {
      doc.text(`PDF Uploaded: ${pdfFile.name}`, 10, 40);
    }

    setNewCourse({
      coursequizID: '',
      courseName: '',
      teacherId: '',
      courseDescription: '',
      imageUrl: '',
      pdfUrl: '',
      videoLink: '',
      status: '',
      Module: '',
      contentOfCourse: [],
    });
    setPdfFile(null);
    setImagePreview('');
    navigate('/courses');
  };

  return (
    <div className="p-8 bg-base-100">
      <h1 className="text-3xl font-bold text-center mb-6">Add New Course</h1>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-lg mx-auto">
        {/* Module */}
        <div>
          <label className="block font-semibold">Module</label>
          <input
            type="text"
            name="Module"
            onChange={handleInputChange}
            className="input input-bordered w-full"
            placeholder="Enter Module Name"
            required
          />
        </div>

        {/* Course Name */}
        <div>
          <label className="block font-semibold">Course Name</label>
          <input
            type="text"
            name="courseName"
            onChange={handleInputChange}
            className="input input-bordered w-full"
            placeholder="Enter Course Name"
            required
          />
        </div>

        {/* Course Description */}
        <div>
          <label className="block font-semibold">Course Description</label>
          <textarea
            name="courseDescription"
            onChange={handleInputChange}
            className="textarea textarea-bordered w-full"
            placeholder="Enter Course Description"
            required
          />
        </div>

        {/* Video Link */}
        <div>
          <label className="block font-semibold">Video Link</label>
          <input
            type="text"
            name="videoLink"
            onChange={handleInputChange}
            className="input input-bordered w-full"
            placeholder="Enter Video Link"
            required
          />
        </div>

        {/* Image Upload */}
        <div>
          <label className="block font-semibold">Upload Image</label>
          <input
            type="file"
            accept="image/*"
            name="imageUrl"
            onChange={handleInputChange}
            className="file-input file-input-bordered w-full"
            required
          />
          {/* Display the image preview */}
          {imagePreview && (
            <div className="mt-2">
              <img src={imagePreview} alt="Image Preview" className="w-32 h-32 object-cover" />
            </div>
          )}
        </div>

        {/* PDF Upload */}
        <div>
          <label className="block font-semibold">Upload PDF</label>
          <input
            type="file"
            accept="application/pdf"
            name="pdfUrl"
            onChange={handleInputChange}
            className="file-input file-input-bordered w-full"
            required
          />
        </div>

        {/* Add Chapter Button */}
        <div>
          <button
            type="button"
            onClick={() => setModalVisible(true)}
            className="btn btn-secondary w-full"
          >
            Add Chapter
          </button>
        </div>

        {/* Submit Button */}
        <button type="submit" className="btn btn-primary w-full">
          Add Course
        </button>
      </form>

      {/* Modal */}
      {modalVisible && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-500 bg-opacity-50">
          <div className="bg-white p-8 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-semibold mb-4">Add New Chapter</h2>
            <form onSubmit={handleAddChapter}>
              <div>
                <label className="block font-semibold">Content Name</label>
                <input
                  type="text"
                  name="contentName"
                  value={newChapter.contentName}
                  onChange={handleChapterInputChange}
                  className="input input-bordered w-full"
                  placeholder="Enter Content Name"
                  required
                />
              </div>

              <div className="mt-4">
                <label className="block font-semibold">Content Description</label>
                <textarea
                  name="contentDescription"
                  value={newChapter.contentDescription}
                  onChange={handleChapterInputChange}
                  className="textarea textarea-bordered w-full"
                  placeholder="Enter Content Description"
                  required
                />
              </div>

              <div className="mt-4 flex justify-between">
                <button
                  type="button"
                  onClick={() => setModalVisible(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Add Chapter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddCourse;
