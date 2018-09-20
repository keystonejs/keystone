import React from 'react';
import Link from 'gatsby-link';

const Sidebar = ({ data }) => {
  return (
    <nav
      style={{
        position: 'sticky',
        backgroundColor: '#fafbfc',
        flex: '0 0 20rem',
        padding: '2rem 1rem',
        minHeight: '100vh',
        minWidth: '200px',
        maxWidth: '300px',
        borderRight: '1px #e1e4e8 solid',
      }}
    >
      <ul style={{ listStyle: 'none' }}>
        {data.allMarkdownRemark.edges.map(({ node }) => (
          <li key={node.id}>
            <Link to={node.fields.slug} style={{ textDecoration: 'none', color: '#348dd9' }}>
              {node.frontmatter.title}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Sidebar;
