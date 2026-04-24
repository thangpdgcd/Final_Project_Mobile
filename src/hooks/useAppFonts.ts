import { Inter_400Regular, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { ViaodaLibre_400Regular } from '@expo-google-fonts/viaoda-libre';
import { useFonts } from 'expo-font';

export const useAppFonts = () => {
  const [loaded] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
    ViaodaLibre_400Regular,
  });

  return loaded;
};

