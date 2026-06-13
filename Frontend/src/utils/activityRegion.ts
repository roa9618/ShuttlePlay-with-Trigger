import { koreanRegions } from './koreanRegions';

export const formatActivityRegion = (activityRegion: string) => (
  Object.prototype.hasOwnProperty.call(koreanRegions, activityRegion)
    ? `${activityRegion} 전체`
    : activityRegion
);

export const splitActivityRegion = (activityRegion: string) => {
  const province = Object.keys(koreanRegions).find((item) => activityRegion === item || activityRegion.startsWith(`${item} `)) || '';
  const district = province ? activityRegion.slice(province.length).trim() || '전체' : '';

  return { province, district };
};
