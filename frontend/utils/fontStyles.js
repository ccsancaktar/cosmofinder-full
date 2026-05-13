// Font stilleri için utility dosyası
export const fontStyles = {
  // Cinzel Decorative font stilleri
  heading: {
    fontFamily: 'CinzelDecorative-Regular',
  },
  headingBold: {
    fontFamily: 'CinzelDecorative-Bold',
  },
  
  // Inter font stilleri
  body: {
    fontFamily: 'Inter-Regular',
  },
  bodyBold: {
    fontFamily: 'Inter-Bold',
  },
  
  // Accent font stilleri
  accent: {
    fontFamily: 'CinzelDecorative-Regular',
  },
  accentBold: {
    fontFamily: 'CinzelDecorative-Bold',
  },
};

// Kullanım örnekleri:
// import { fontStyles } from '../utils/fontStyles';
// 
// const styles = StyleSheet.create({
//   title: {
//     ...fontStyles.headingBold,
//     fontSize: 24,
//     color: '#FFFFFF',
//   },
//   description: {
//     ...fontStyles.body,
//     fontSize: 16,
//     color: '#CCCCCC',
//   },
// });
