import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router';
import { updateCourse, fetchCourses } from '../../features/coursesFormateur/coursesFormateurSlice';
import jsPDF from 'jspdf';

const UpdateCourse = () => {
  const { courseId } = useParams(); // Match courseId from route params
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { courses, status } = useSelector((state) => state.courses);

  const [courseData, setCourseData] = useState({
    coursequizID: '',
    courseName: '',
    teacherId: '',
    teacherName: '',
    courseDescription: '',
    imageUrl: '', // Image will be stored as base64
    pdfUrl: '',
    videoLink: '',
    status: '',
    Module: '',
    contentOfCourse: [], // Content for the chapters
  });

  const [pdfFile, setPdfFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(''); // To show the image preview
  const [pdfPreviewData, setPdfPreviewData] = useState('');

  // State for managing modal and content fields
  const [modalVisible, setModalVisible] = useState(false);
  const [currentContent, setCurrentContent] = useState({
    contentId: '',
    contentName: '',
    contentDescription: '',
  });

  // Fetch courses or set course data when component mounts
  useEffect(() => {
    if (status === 'idle' && !courses.length) {
      dispatch(fetchCourses());
    } else {
      const course = courses.find((course) => course.id === courseId);
      if (course) {
        setCourseData(course);
        setImagePreview(course.imageUrl); // Set image preview from the existing image URL
      }
    }
  }, [dispatch, courseId, courses, status]);

  // Handle input changes for text fields
  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === 'pdfUrl' && files[0]) {
      setPdfFile(files[0]); // Store file
      const reader = new FileReader();
      reader.onload = (event) => {
        setPdfPreviewData(event.target.result); // Preview PDF
      };
      reader.readAsDataURL(files[0]);
    } else if (name === 'imageUrl' && files[0]) {
      // Handle image file upload
      const file = files[0];
      const reader = new FileReader();
      reader.onload = () => {
        setCourseData({ ...courseData, imageUrl: reader.result });
        setImagePreview(reader.result); // Display image preview
      };
      reader.readAsDataURL(file); // Convert image to base64
    } else {
      setCourseData({ ...courseData, [name]: value });
    }
  };

  // Handle form submission for course
  const handleSubmit = (e) => {
    e.preventDefault();

    const updatedCourse = {
      ...courseData,
      id: courseId, // Ensure the course ID is sent
      pdfUrl: pdfFile ? pdfFile.name : courseData.pdfUrl, // File name or existing value
    };

    dispatch(updateCourse({ id: courseId, updatedCourse }))
      .unwrap()
      .then(() => {
        navigate('/courses'); // Navigate back
      })
      .catch((error) => {
        console.error('Error updating course:', error);
      });

    // Generate PDF with jsPDF (optional)
    const doc = new jsPDF();
    doc.text(`Module: ${courseData.Module}`, 10, 10);
    doc.text(`courseName: ${courseData.courseName}`, 10, 20);
    doc.text(`imageUrl: ${courseData.imageUrl}`, 10, 30);

    if (pdfFile) {
      doc.text(`PDF Uploaded: ${pdfFile.name}`, 10, 40);
    }
  };

  // Open modal to edit content
  const openEditContentModal = (content) => {
    setCurrentContent(content); // Set current content values to the modal
    setModalVisible(true); // Open modal
  };

  // Handle content update in the modal
  const handleContentChange = (e) => {
    const { name, value } = e.target;
    setCurrentContent({ ...currentContent, [name]: value });
  };

  const handleContentSubmit = (e) => {
    e.preventDefault();
    const updatedContentList = courseData.contentOfCourse.map((content) =>
      content.contentId === currentContent.contentId
        ? {
            ...content,
            contentName: currentContent.contentName,
            contentDescription: currentContent.contentDescription,
          }
        : content
    );
    setCourseData({ ...courseData, contentOfCourse: updatedContentList });
    setModalVisible(false); // Close modal
  };

  return (
    <div className="w-full p-8">
      <h2 className="text-center text-2xl font-bold mb-4">Update Course</h2>
      <form onSubmit={handleSubmit}>
        {/* Module */}
        <div className="mb-4">
          <label className="block font-semibold">Module</label>
          <input
            type="text"
            name="Module"
            value={courseData.Module}
            onChange={handleChange}
            className="input input-bordered w-full"
            required
          />
        </div>

        {/* Course Name */}
        <div className="mb-4">
          <label className="block font-semibold">Course Name</label>
          <input
            type="text"
            name="courseName"
            value={courseData.courseName}
            onChange={handleChange}
            className="input input-bordered w-full"
            required
          />
        </div>

        {/* Course Description */}
        <div className="mb-4">
          <label className="block font-semibold">Course Description</label>
          <textarea
            name="courseDescription"
            value={courseData.courseDescription}
            onChange={handleChange}
            className="textarea textarea-bordered w-full"
            required
          />
        </div>

        {/* Video Link */}
        <div className="mb-4">
          <label className="block font-semibold">Video Link</label>
          <input
            type="text"
            name="videoLink"
            value={courseData.videoLink}
            onChange={handleChange}
            className="input input-bordered w-full"
            required
          />
        </div>

        {/* Image Upload */}
        <div className="mb-4">
          <label className="block font-semibold">Image Upload</label>
          <input
            type="file"
            name="imageUrl"
            accept="image/*"
            onChange={handleChange}
            className="file-input file-input-bordered w-full"
          />
          {/* Image preview */}
          {imagePreview && (
            <div className="mt-4">
              <img src={imagePreview} alt="Image Preview" className="w-32 h-32 object-cover" />
            </div>
          )}
        </div>

        {/* PDF Upload */}
        <div className="mb-4">
          <label className="block font-semibold">Upload PDF</label>
          <input
            type="file"
            name="pdfUrl"
            accept="application/pdf"
            onChange={handleChange}
            className="file-input file-input-bordered w-full"
          />
        </div>

        {pdfPreviewData && (
          <div className="pdf-preview mt-4 border p-4">
            <embed src={pdfPreviewData} type="application/pdf" width="100%" height="400px" />
          </div>
        )}

        {/* Chapters List */}
        <div className="mb-4">
          <h3 className="font-semibold">Chapters</h3>
          {courseData.contentOfCourse.map((content) => (
            <div key={content.contentId} className="flex justify-between items-center">
              <span>{content.contentName}</span>
              <button
                type="button"
                onClick={() => openEditContentModal(content)}
                className="btn btn-link"
              >
                Edit
              </button>
            </div>
          ))}
        </div>

        {/* Submit Button */}
        <button type="submit" className="btn btn-primary mt-4">
          Save Changes
        </button>
      </form>

      {/* Modal */}
      {modalVisible && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-500 bg-opacity-50">
          <div className="bg-white p-8 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-semibold mb-4">Edit Content</h2>
            <form onSubmit={handleContentSubmit}>
              <div>
                <label className="block font-semibold">Content Name</label>
                <input
                  type="text"
                  name="contentName"
                  value={currentContent.contentName}
                  onChange={handleContentChange}
                  className="input input-bordered w-full"
                  required
                />
              </div>

              <div className="mt-4">
                <label className="block font-semibold">Content Description</label>
                <textarea
                  name="contentDescription"
                  value={currentContent.contentDescription}
                  onChange={handleContentChange}
                  className="textarea textarea-bordered w-full"
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
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UpdateCourse;
