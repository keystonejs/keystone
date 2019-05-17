export default function Error({ error }) {
  console.error('Error loading data:', error);
  return 'Something went wrong...';
}
