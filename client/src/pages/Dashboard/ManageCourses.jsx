import React from 'react'
import CourseManagement from '../../components/CourseManagement'

const ManageCourses = ({ isInstitution }) => {
  return (
    <div className='mt-10'>
      <CourseManagement isInstitution={isInstitution} />
    </div>
  )
}

export default ManageCourses