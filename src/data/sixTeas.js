// 六大茶类：发酵度、工艺流程、理化成分
export const teaData = [
  { name: '绿茶', en: 'Green Tea', ferment: 0, color: '#6a9e4b', process: ['鲜叶', '杀青', '揉捻', '干燥'],
    features: { 茶多酚: 18.5, 咖啡碱: 4.2, 茶氨酸: 2.8, 可溶性糖: 3.5, 茶黄素: 0.1, 茶红素: 0.2 } },
  { name: '白茶', en: 'White Tea', ferment: 10, color: '#b5aa8c', process: ['鲜叶', '萎凋', '干燥'],
    features: { 茶多酚: 17.8, 咖啡碱: 4.0, 茶氨酸: 3.5, 可溶性糖: 4.2, 茶黄素: 0.2, 茶红素: 0.3 } },
  { name: '黄茶', en: 'Yellow Tea', ferment: 20, color: '#cfb53b', process: ['鲜叶', '杀青', '揉捻', '闷黄', '干燥'],
    features: { 茶多酚: 14.5, 咖啡碱: 3.6, 茶氨酸: 2.2, 可溶性糖: 3.8, 茶黄素: 0.8, 茶红素: 1.2 } },
  { name: '青茶', en: 'Oolong Tea', ferment: 40, color: '#2e8b9e', process: ['鲜叶', '萎凋', '做青', '杀青', '揉捻', '干燥'],
    features: { 茶多酚: 13.6, 咖啡碱: 3.6, 茶氨酸: 1.9, 可溶性糖: 4.5, 茶黄素: 0.4, 茶红素: 4.2 } },
  { name: '红茶', en: 'Black Tea', ferment: 80, color: '#b53c2c', process: ['鲜叶', '萎凋', '揉捻', '发酵', '干燥'],
    features: { 茶多酚: 12.5, 咖啡碱: 3.8, 茶氨酸: 2.1, 可溶性糖: 4.2, 茶黄素: 0.6, 茶红素: 9.3 } },
  { name: '黑茶', en: 'Dark Tea', ferment: 95, color: '#3e2e1f', process: ['鲜叶', '杀青', '揉捻', '渥堆', '干燥'],
    features: { 茶多酚: 9.8, 咖啡碱: 3.2, 茶氨酸: 1.2, 可溶性糖: 5.8, 茶黄素: 0.2, 茶红素: 10.5 } },
]

export const featureKeys = ['茶多酚', '咖啡碱', '茶氨酸', '可溶性糖', '茶黄素', '茶红素']
