export type ViewContainer = 'enapter-blueprints'
type ViewsKey = 'views'

type ShortViewID = 'upload' | 'devices.recent'

type ViewID = `${ViewContainer}.${ViewsKey}.${ShortViewID}`

type CamelCasedShortID<T extends string> = T extends `${infer Prefix}.${infer Rest}`
  ? `${Prefix}${CamelCasedShortID<Capitalize<Rest>>}`
  : T;

export const viewIDs: Record<CamelCasedShortID<ShortViewID>, ViewID> = {
  upload: 'enapter-blueprints.views.upload',
  devicesRecent: 'enapter-blueprints.views.devices.recent',
};
