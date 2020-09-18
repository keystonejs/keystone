// const KeystoneItemForm = ({ onChange, value, fields, validate, errors }) => <form />;
// const KeystoneTextField = () => <div />;

// type Error = {
//   path?: string;
//   message: string;
// };

// type Errors = Error[];

// // export const controller = () => {
// //   return {
// //     onChange:
// //   };
// // }

// export function ItemForm({ errors, fields, value, onChange, onError }) {
//   return (
//     <KeystoneItemForm
//       onChange={(value) => {
//         if (value.state === 'published' && !value.publishDate) {
//           onError({
//             path: 'publishDate',
//             message: 'You need to set a publish date because the post is published',
//           });
//         } else {
//           onError(null);
//         }
//         onChange({ ...value, roles: value.isAdmin ? value.roles : '' });
//       }}
//       value={value}
//       errors={errors}
//       fields={{
//         ...fields,
//         roles: {
//           ...fields.roles,
//           fieldMode: value.isAdmin ? 'edit' : 'hidden',
//         },
//       }}
//     />
//   );
// }

export {};
