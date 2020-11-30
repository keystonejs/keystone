import { products } from './data';

export async function insertSeedData({ mongoose }: { mongoose?: any }) {
  console.log('------------ INSERTING DUMMY DATA ------------');
  for (const product of products) {
    const { _id } = await mongoose
      .model('ProductImage')
      .create({ image: product.image, altText: product.description });
    product.image = _id;
    await mongoose.model('Product').create(product);
  }
  console.log('------------ DUMMY DATA ADDED! ------------');
  console.log('👋🏻 Please start the process with `yarn dev`');
  process.exit();
}
