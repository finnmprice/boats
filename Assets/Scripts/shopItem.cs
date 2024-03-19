using UnityEngine;
using TMPro;

public class shopItem : MonoBehaviour
{
    [SerializeField] TextMeshProUGUI keyText;
    [SerializeField] TextMeshProUGUI itemNameText;
    [SerializeField] TextMeshProUGUI itemPriceText;

    public int key;
    public int shopItemLevel;

    public void Setup(int _key, string _shopItemName)
    {
        keyText.text = _key.ToString();
        itemNameText.text = _shopItemName;
        itemPriceText.text = "$10";

        shopItemLevel = 1;
        key = _key;
    }
    
    public void UpdateShop() {
        itemPriceText.text = (shopItemLevel < 10) ? ("$" + (shopItemLevel * 10).ToString()) : ("max");
    }

    void Start()
    {

    }

    void Update()
    {

    }
}
