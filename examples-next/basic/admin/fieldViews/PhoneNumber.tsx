export const RelatedItemCard = ({ data }) => {
  return (
    <div>
      Phone number: {data.value} ({data.type})
    </div>
  );
};
