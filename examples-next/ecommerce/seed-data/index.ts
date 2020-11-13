import { products } from './data';

export async function insertSeedData(keystone: any) {
  console.log('------------ INSERTING DUMMY DATA ------------');
  const { mongoose } = keystone.adapters.MongooseAdapter;
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
