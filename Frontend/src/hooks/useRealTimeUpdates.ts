
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

// This interface represents a card from the loyalty cards data
interface LoyaltyCard {
  id: number;
  name: string;
  image: string;
  category: string;
  points: number;
  redemptionThreshold: number;
}

// This hook connects to Supabase for real-time updates
export const useRealTimeUpdates = (initialCards: LoyaltyCard[]) => {
  const [cards, setCards] = useState<LoyaltyCard[]>(initialCards);
  const [updatedCardId, setUpdatedCardId] = useState<number | null>(null);

  // Subscribe to real-time updates on customer_cards table
  useEffect(() => {
    // Subscribe to changes on the customer_cards table
    const channel = supabase
      .channel('customer-cards-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'customer_cards'
        },
        (payload) => {
          console.log('Real-time update received:', payload);
          
          // Find and update the card in our local state
          if (payload.new && cards.length > 0) {
            const cardId = payload.new.card_id;
            const updatedCard = cards.find(card => card.id === cardId);
            
            if (updatedCard) {
              const newCards = cards.map(card => 
                card.id === cardId 
                  ? { ...card, points: payload.new.points } 
                  : card
              );
              
              setCards(newCards);
              setUpdatedCardId(cardId as number);
              
              setTimeout(() => {
                setUpdatedCardId(null);
              }, 2000);
            }
          }
        }
      )
      .subscribe();

    // Cleanup subscription on component unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [cards]);

  return { cards, updatedCardId };
};
