import React from 'react';
import { motion } from 'framer-motion';

interface SkillsProps {
  data: any;
}

const Skills: React.FC<SkillsProps> = ({ data }) => {
  const skillCategories = [
    {
      title: 'Frontend Development',
      skills: data.skills?.frontend || ['React', 'TypeScript', 'Tailwind CSS', 'Next.js'],
      icon: '💻'
    },
    {
      title: 'Backend Development',
      skills: data.skills?.backend || ['Node.js', 'Express', 'MongoDB', 'PostgreSQL'],
      icon: '⚙️'
    },
    {
      title: 'Tools & Technologies',
      skills: data.skills?.tools || ['Git', 'Docker', 'Firebase', 'AWS'],
      icon: '🛠️'
    },
    {
      title: 'Languages',
      skills: data.skills?.languages || ['JavaScript', 'Python', 'TypeScript', 'SQL'],
      icon: '💬'
    }
  ];

  return (
    <section id="skills" className="pt-16 py-20 px-4 sm:px-6 lg:px-8 bg-gray-800/50">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">What I Do</h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            A collection of technologies and tools I've worked with throughout my journey as a developer.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {skillCategories.map((category, index) => (
            <motion.div
              key={index}
              className="bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <div className="text-4xl mb-4">{category.icon}</div>
              <h3 className="text-xl font-semibold mb-4 text-purple-400">{category.title}</h3>
              <div className="flex flex-wrap gap-2">
                {category.skills.map((skill: string, skillIndex: number) => (
                  <span
                    key={skillIndex}
                    className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Skills;