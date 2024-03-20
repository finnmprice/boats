using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class ShopController : MonoBehaviour
{
    public static ShopController instance;

    public void Awake() { instance = this; }

    public void UpdateShopItem(int keyNumber, int newLevel)
    {
        foreach (Transform shopItemTransform in Settings.instance.shopParent)
        {
            shopItem shopItemComponent = shopItemTransform.GetComponent<shopItem>();
            if (shopItemComponent != null && shopItemComponent.key == keyNumber)
            {
                shopItemComponent.UpdateShop(newLevel);
                break; 
            }
        }
    }

    void Start()
    {
        
    }

    void Update()
    {
        
    }
}
