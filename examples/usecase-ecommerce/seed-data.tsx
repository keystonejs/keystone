import { getContext } from '@keystone-6/core/context';
import { products } from '../example-data';
import config from './keystone';
import * as PrismaModule from '.prisma/client';

export async function main() {
  const context = getContext(config, PrismaModule);

  console.log(`🌱 Inserting Seed Data: ${products.length} Products`);
  for (const product of products) {
    console.log(`  🛍️ Adding Product: ${product.name}`);
    const { id } = await context.prisma.productImage.create({
      data: { image: JSON.stringify(product.photo), altText: product.description },
    });

    const { photo, ...data } = product;
    await context.prisma.product.create({
      data: {
        photoId: id,
        ...data,
      },
    });
  }

  console.log(`✅ Seed Data Inserted: ${products.length} Products`);
  console.log(`👋 Please start the process with \`yarn dev\` or \`npm run dev\``);
}

main();
