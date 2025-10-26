import Lanyard from '@/components/Lanyard';
import { props } from '@webflow/data-types';
import { declareComponent } from '@webflow/react';

import '@/app/globals.css';

interface WebflowLanyardProps {
  positionX: number;
  positionY: number;
  positionZ: number;
  gravityX: number;
  gravityY: number;
  gravityZ: number;
  fov: number;
  transparent: boolean;
  cardGlbUrl: string;
  lanyardTextureUrl: string;
}

const LanyardWrapper = ({
  positionX,
  positionY,
  positionZ,
  gravityX,
  gravityY,
  gravityZ,
  fov,
  transparent,
  cardGlbUrl,
  lanyardTextureUrl
}: WebflowLanyardProps) => {
  return (
    <Lanyard
      position={[positionX, positionY, positionZ]}
      gravity={[gravityX, gravityY, gravityZ]}
      fov={fov}
      transparent={transparent}
      cardGlbUrl={cardGlbUrl}
      lanyardTextureUrl={lanyardTextureUrl}
    />
  );
};

export default declareComponent(LanyardWrapper, {
  name: 'Lanyard',
  description: 'Interactive 3D lanyard with physics simulation',
  group: '3D',
  props: {
    positionX: props.Number({
      name: "Camera Position X",
      defaultValue: 0,
      tooltip: "Camera X position"
    }),
    positionY: props.Number({
      name: "Camera Position Y",
      defaultValue: 0,
      tooltip: "Camera Y position"
    }),
    positionZ: props.Number({
      name: "Camera Position Z",
      defaultValue: 30,
      tooltip: "Camera Z position (distance from object)"
    }),
    gravityX: props.Number({
      name: "Gravity X",
      defaultValue: 0,
      tooltip: "Gravity force in X direction"
    }),
    gravityY: props.Number({
      name: "Gravity Y",
      defaultValue: -40,
      tooltip: "Gravity force in Y direction"
    }),
    gravityZ: props.Number({
      name: "Gravity Z",
      defaultValue: 0,
      tooltip: "Gravity force in Z direction"
    }),
    fov: props.Number({
      name: "Field of View",
      defaultValue: 20,
      tooltip: "Camera field of view (FOV)"
    }),
    transparent: props.Boolean({
      name: "Transparent Background",
      defaultValue: true,
      tooltip: "Enable transparent canvas background"
    }),
    cardGlbUrl: props.Text({
      name: "Card GLB URL",
      defaultValue: "https://ndwpkcunrxyawpozuzlw.supabase.co/storage/v1/object/public/ticket_orders/assets/card.glb",
      tooltip: "URL to the card 3D model (GLB file)"
    }),
    lanyardTextureUrl: props.Text({
      name: "Lanyard Texture URL",
      defaultValue: "https://ndwpkcunrxyawpozuzlw.supabase.co/storage/v1/object/public/ticket_orders/assets/lanyard.png",
      tooltip: "URL to the lanyard texture (PNG file)"
    }),
  },
});
