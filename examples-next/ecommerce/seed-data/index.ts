import { products } from './data';

export async function insertSeedData(keystone: any) {
  console.log(`---- 🌱 Inserting Seed Data: ${products.length} Products -----`);
  const { mongoose } = keystone.adapters.MongooseAdapter;
  for (const product of products) {
    console.log(`Adding: ${product.name}`);
    const { _id } = await mongoose
    .model('ProductImage')
    .create({ image: product.image, altText: product.description });
    product.image = _id;
    const res = await mongoose.model('Product').create(product);
    console.log(res);
  }
  console.log(`---- ✅ Seed Data Inserted: ${products.length} Products -----`);
  console.log(`👋🏻 Please start the process with \`yarn dev\``);
  process.exit();
}
