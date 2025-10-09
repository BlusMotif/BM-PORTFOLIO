import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { getFileURL } from '../firebase/storage';

interface ProjectsProps {
  data: any;
}

const Projects: React.FC<ProjectsProps> = ({ data }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const projects = Array.isArray(data.projects) ? data.projects : [];

  const filteredProjects = projects.filter((project: any) => {
    const searchText = `${project.title} ${project.description} ${project.technologies?.join(' ')}`.toLowerCase();
    return searchText.includes(searchTerm.toLowerCase());
  });

  const ImageLoader: React.FC<{ src: string; alt: string; className?: string }> = ({ src, alt, className }) => {
    const [imageSrc, setImageSrc] = useState<string>('');
    const [loading, setLoading] = useState(true);

    React.useEffect(() => {
      // Clear the image source first to force re-loading
      setImageSrc('');
      setLoading(true);

      const loadImage = async () => {
        try {
          if (!src) {
            // Use fallback placeholder for empty src
            setImageSrc("https://picsum.photos/600/400?random=fallback");
          } else if (src.startsWith('data:') || src.startsWith('http')) {
            setImageSrc(src);
          } else {
            // Use key to fetch from database
            const url = await getFileURL(src);
            setImageSrc(url || "https://picsum.photos/600/400?random=fallback");
          }
        } catch (error) {
          console.error('Error loading image:', error);
          // Fallback to placeholder
          setImageSrc("https://picsum.photos/600/400?random=fallback");
        } finally {
          setLoading(false);
        }
      };

      loadImage();
    }, [src]);

    if (loading) {
      return (
        <div className={`bg-gray-700 animate-pulse ${className}`} />
      );
    }

    return (
      <img
        src={imageSrc}
        alt={alt}
        className={className}
        onError={(e) => {
          console.error('Image failed to load:', src);
          e.currentTarget.style.display = 'none';
        }}
      />
    );
  };

  return (
    <section id="projects" className="pt-16 py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">{data.projects?.title || "Recent Projects"}</h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-8">
            {data.projects?.subtitle || "A selection of my recent work and personal projects that showcase my skills and expertise."}
          </p>
          <div className="max-w-md mx-auto">
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((project: any, index: number) => (
            <motion.div
              key={index}
              className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <div className="relative">
                <ImageLoader
                  key={project.image}
                  src={project.image}
                  alt={project.title}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-4 right-4">
                  <span className="bg-purple-500 text-white px-2 py-1 rounded text-sm">Featured</span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">{project.title}</h3>
                <p className="text-gray-400 mb-4">{project.description}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.tags?.map((tag: string, tagIndex: number) => (
                    <span
                      key={tagIndex}
                      className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex space-x-4">
                  {project.githubUrl && (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-400 hover:text-purple-300 transition-colors"
                    >
                      Code
                    </a>
                  )}
                  {project.liveUrl && (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-400 hover:text-purple-300 transition-colors"
                    >
                      Demo
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Projects;