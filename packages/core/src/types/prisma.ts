export type PrismaFilter = Record<string, any> & {
  _____?: 'prisma filter'
  AND?: PrismaFilter[] | PrismaFilter
  OR?: PrismaFilter[] | PrismaFilter
  NOT?: PrismaFilter[] | PrismaFilter
  // just so that if you pass an array to something expecting a PrismaFilter, you get an error
  length?: undefined
  // so that if you pass a promise, you get an error
  then?: undefined
}

export type UniquePrismaFilter = Record<string, any> & {
  _____?: 'unique prisma filter'
  // so that if you pass a promise, you get an error
  then?: undefined
}
