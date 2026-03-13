// Course configuration for the entire application
// This maps URL slugs to course codes stored in the database

export const COURSE_CONFIG = {
  // Basic Education Center
  "basic-education": {
    label: "Basic Education Center",
    courses: {
      elementary: {
        code: "ELEM",
        label: "Elementary School",
        description: "Elementary School Students",
      },
      "junior-highschool": {
        code: "JHS",
        label: "Junior Highschool",
        description: "Junior Highschool Students",
      },
      "senior-highschool": {
        code: "SHS",
        label: "Senior Highschool",
        description: "Senior Highschool Students",
        tracks: {
          abm: {
            code: "SHS-ABM",
            label: "Accountancy and Business Management (ABM)",
            track: "Academic Track",
          },
          stem: {
            code: "SHS-STEM",
            label: "Science Technology Engineering and Mathematics (STEM)",
            track: "Academic Track",
          },
          humss: {
            code: "SHS-HUMSS",
            label: "Humanities and Social Science (HUMSS)",
            track: "Academic Track",
          },
          he: {
            code: "SHS-HE",
            label: "Home Economics (HE)",
            track: "Technical-Vocational Track",
          },
          ict: {
            code: "SHS-ICT",
            label: "Information and Communication Technology (ICT)",
            track: "Technical-Vocational Track",
          },
        },
      },
    },
  },

  // College Degree
  college: {
    label: "College Degree",
    courses: {
      bsge: {
        code: "BSGE",
        label: "Bachelor of Science in Geodetic Engineering",
        description: "BSGE Students",
      },
      bsa: {
        code: "BSA",
        label: "Bachelor of Science in Accountancy",
        description: "BSA Students",
      },
      beed: {
        code: "BEEd",
        label: "Bachelor of Elementary Education",
        description: "BEEd Students",
      },
      bsed: {
        code: "BSEd",
        label: "Bachelor of Secondary Education",
        description: "BSEd Students",
        majors: {
          math: {
            code: "BSEd-Math",
            label: "Major in Math",
          },
          english: {
            code: "BSEd-English",
            label: "Major in English",
          },
          filipino: {
            code: "BSEd-Filipino",
            label: "Major in Filipino",
          },
          science: {
            code: "BSEd-Science",
            label: "Major in Science",
          },
        },
      },
      bscrim: {
        code: "BSCrim",
        label: "Bachelor of Science in Criminology",
        description: "BSCrim Students",
      },
      bsn: {
        code: "BSN",
        label: "Bachelor of Science in Nursing",
        description: "BSN Students",
      },
      "ab-polsci": {
        code: "AB-PolSci",
        label: "Bachelor of Arts in Political Science",
        description: "AB PolSci Students",
      },
      "ab-english": {
        code: "AB-English",
        label: "Bachelor of Arts in English Language Studies",
        description: "AB English Students",
      },
      abcom: {
        code: "ABCom",
        label: "Bachelor of Arts in Communication",
        description: "ABCom Students",
      },
      bsba: {
        code: "BSBA",
        label: "Bachelor of Science in Business Administration",
        description: "BSBA Students",
        majors: {
          "financial-management": {
            code: "BSBA-FM",
            label: "Financial Management",
          },
          "marketing-management": {
            code: "BSBA-MM",
            label: "Marketing Management",
          },
          "human-resource-management": {
            code: "BSBA-HRM",
            label: "Human Resource Management",
          },
        },
      },
      bsma: {
        code: "BSMA",
        label: "Bachelor of Science in Management Accounting",
        description: "BSMA Students",
      },
      bsit: {
        code: "BSIT",
        label: "Bachelor of Science in Information Technology",
        description: "BSIT Students",
      },
      bshm: {
        code: "BSHM",
        label: "Bachelor of Science in Hospitality Management",
        description: "BSHM Students",
      },
    },
  },

  // Post Graduate Courses
  graduate: {
    label: "Post Graduate Courses",
    courses: {
      phd: {
        code: "Ph.D",
        label: "Doctor of Philosophy",
        description: "Ph.D Students",
      },
      edd: {
        code: "Ed.D",
        label: "Doctor of Education",
        description: "Ed.D Students",
      },
      maed: {
        code: "MA.Ed",
        label: "Master of Arts in Education",
        description: "MA.Ed Students",
      },
      "maed-ll": {
        code: "MA.Ed-LL",
        label: "Master of Arts in Education Major in Language and Literature",
        description: "MA.Ed-L.L Students",
      },
      mpa: {
        code: "MPA",
        label: "Master in Public Administration",
        description: "MPA Students",
      },
      mba: {
        code: "MBA",
        label: "Master in Business Administration",
        description: "MBA Students",
      },
    },
  },
};

// Helper function to get course info from URL params
export function getCourseInfo(category, course, specialization = null) {
  const categoryConfig = COURSE_CONFIG[category];
  if (!categoryConfig) return null;

  const courseConfig = categoryConfig.courses[course];
  if (!courseConfig) return null;

  // If there's a specialization (major or track)
  if (specialization) {
    const spec = courseConfig.majors?.[specialization] || courseConfig.tracks?.[specialization];
    if (spec) {
      return {
        code: spec.code,
        label: spec.label,
        parentLabel: courseConfig.label,
        categoryLabel: categoryConfig.label,
        track: spec.track || null,
      };
    }
    return null;
  }

  return {
    code: courseConfig.code,
    label: courseConfig.label,
    description: courseConfig.description,
    categoryLabel: categoryConfig.label,
    hasMajors: !!courseConfig.majors,
    hasTracks: !!courseConfig.tracks,
  };
}

// Get all course codes for a given category (for fetching all students in a category)
export function getCategoryCodes(category) {
  const categoryConfig = COURSE_CONFIG[category];
  if (!categoryConfig) return [];

  const codes = [];
  Object.values(categoryConfig.courses).forEach((course) => {
    codes.push(course.code);
    if (course.majors) {
      Object.values(course.majors).forEach((major) => codes.push(major.code));
    }
    if (course.tracks) {
      Object.values(course.tracks).forEach((track) => codes.push(track.code));
    }
  });
  return codes;
}

// Get list of all course codes for dropdown/select options
export function getAllCourseOptions() {
  const options = [];

  Object.entries(COURSE_CONFIG).forEach(([categoryKey, category]) => {
    // Add category header
    options.push({
      type: "header",
      label: category.label,
    });

    Object.entries(category.courses).forEach(([courseKey, course]) => {
      // Add main course
      options.push({
        code: course.code,
        label: course.label,
      });

      // Add majors if any
      if (course.majors) {
        Object.entries(course.majors).forEach(([majorKey, major]) => {
          options.push({
            code: major.code,
            label: `  └ ${major.label}`,
          });
        });
      }

      // Add tracks if any
      if (course.tracks) {
        Object.entries(course.tracks).forEach(([trackKey, track]) => {
          options.push({
            code: track.code,
            label: `  └ ${track.label}`,
          });
        });
      }
    });
  });

  return options;
}
