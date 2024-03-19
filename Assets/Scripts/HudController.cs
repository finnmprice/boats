using UnityEngine;

public class HUDController : MonoBehaviour{
    private void Start()
    {
        foreach (ShopItem shopItemData in Settings.instance.shopItems)
        {
            GameObject newShopItem = Instantiate(Settings.instance.shopItemPrefab, Settings.instance.shopParent);
            shopItem shopItemComponent = newShopItem.GetComponent<shopItem>();
            if (shopItemComponent != null)
            {
                shopItemComponent.Setup(shopItemData.key, shopItemData.name);
            }
        }
    }
}