import React, { createContext, useContext, useState, useEffect } from "react";
import CourseServices from "../services/CourseServices";

const CoursesContext = createContext();

export const useCoursesContext = () => {
  const context = useContext(CoursesContext);
  if (!context) {
    throw new Error("useCoursesContext must be used within CoursesProvider");
  }
  return context;
};

export function CoursesProvider({ children }) {
  const [courses, setCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [coursesError, setCoursesError] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await CourseServices.getAllCourses();
        if (response.success) {
          setCourses(response.data);
        } else {
          setCoursesError("Failed to load courses");
        }
      } catch (error) {
        console.error("Failed to fetch courses:", error);
        setCoursesError("Failed to load courses");
      } finally {
        setCoursesLoading(false);
      }
    };

    fetchCourses();
  }, []);

  return (
    <CoursesContext.Provider value={{ courses, coursesLoading, coursesError }}>
      {children}
    </CoursesContext.Provider>
  );
}
