import { KeystoneContext } from './context';
import { BaseListTypeInfo } from './type-info';

const someContext: KeystoneContext<{
  lists: {
    Singleton: BaseListTypeInfo & { isSingleton: true };
    List: BaseListTypeInfo & { isSingleton: false };
    ListOrSingleton: BaseListTypeInfo;
  };
  prisma: any;
}> = undefined!;

someContext.query.Singleton.findOne({});
someContext.query.Singleton.findOne({ where: { id: '1' } });
// @ts-expect-error
someContext.query.List.findOne({});
someContext.query.List.findOne({ where: { id: '1' } });
// @ts-expect-error
someContext.query.ListOrSingleton.findOne({});
someContext.query.ListOrSingleton.findOne({ where: { id: '1' } });
