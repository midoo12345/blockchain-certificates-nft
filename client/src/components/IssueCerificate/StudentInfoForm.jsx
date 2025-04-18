 
import React from 'react';
import LoadingSpinner from '../Shared/LoadingSpinner';

function StudentInfoForm({
    formData,
    onInputChange,
    validationErrors,
    touchedFields,
    loading,
    courses,
    loadingCourses
}) {
    const handleChange = (e) => {
        const { name, value } = e.target;
        onInputChange(name, value);
    };

    return (
        <div className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                    Student Address
                </label>
                <input
                    type="text"
                    name="studentAddress"
                    value={formData.studentAddress}
                    onChange={handleChange}
                    placeholder="0x..."
                    disabled={loading}
                    className={`w-full px-4 py-3 bg-gray-700/20 text-white outline-none rounded focus:ring-1 focus:ring-violet-500 focus:border-transparent ${validationErrors.studentAddress && touchedFields.studentAddress
                            ? 'border-red-500'
                            : 'border-gray-600'
                        }`}
                />
                {validationErrors.studentAddress && touchedFields.studentAddress && (
                    <p className="mt-2 text-sm text-red-400">{validationErrors.studentAddress}</p>
                )}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                    Course
                </label>
                <select
                    name="courseId"
                    value={formData.courseId}
                    onChange={handleChange}
                    disabled={loading || loadingCourses}
                    className={`w-full px-4 py-3 bg-gray-700/20 text-white outline-none  rounded focus:ring-1 focus:ring-violet-500 focus:border-transparent ${validationErrors.courseId && touchedFields.courseId
                            ? 'border-red-500'
                            : 'border-gray-600'
                        }`}
                >
                    <option value="" className=' text-slate-900' >Select a course</option>
                    {loadingCourses ? (
                        <option disabled>Loading courses...</option>
                    ) : (
                        courses.map(course => (
                            <option key={course.id} value={course.id}  className=' text-slate-900'>
                                {course.name}
                            </option>
                        ))
                    )}
                </select>
                {validationErrors.courseId && touchedFields.courseId && (
                    <p className="mt-2 text-sm text-red-400">{validationErrors.courseId}</p>
                )}
                {loadingCourses && (
                    <div className="mt-2 flex items-center gap-2 text-gray-400">
                        <LoadingSpinner size="small" />
                        <span className="text-sm">Loading courses...</span>
                    </div>
                )}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                    Grade
                </label>
                <input
                    type="text"
                    name="grade"
                    value={formData.grade}
                    onChange={handleChange}
                    placeholder="A, B, C, D, F"
                    disabled={loading}
                    className={`w-full px-4 py-3 bg-gray-700/20 text-white outline-none rounded focus:ring-1 focus:ring-violet-500 focus:border-transparent ${validationErrors.grade && touchedFields.grade
                            ? 'border-red-500'
                            : 'border-gray-600'
                        }`}
                />
                {validationErrors.grade && touchedFields.grade && (
                    <p className="mt-2 text-sm text-red-400">{validationErrors.grade}</p>
                )}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                    Certificate Title
                </label>
                <input
                    type="text"
                    name="certificateData"
                    value={formData.certificateData}
                    onChange={handleChange}
                    placeholder="e.g. Computer Science Degree"
                    disabled={loading}
                    className={`w-full px-4 py-3 bg-gray-700/20 text-white outline-none rounded focus:ring-1 focus:ring-violet-500 focus:border-transparent ${validationErrors.certificateData && touchedFields.certificateData
                            ? 'border-red-500'
                            : 'border-gray-600'
                        }`}
                />
                {validationErrors.certificateData && touchedFields.certificateData && (
                    <p className="mt-2 text-sm text-red-400">{validationErrors.certificateData}</p>
                )}
            </div>
        </div>
    );
}

export default StudentInfoForm;


 