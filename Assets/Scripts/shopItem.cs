using UnityEngine;
using TMPro;

public class shopItem : MonoBehaviour
{
    [SerializeField] TextMeshProUGUI keyText;
    [SerializeField] TextMeshProUGUI itemNameText;
    [SerializeField] TextMeshProUGUI itemPriceText;
    [SerializeField] GameObject upgradeProgress;
    private RectTransform progressTransform;

    public int key;
    private int shopItemLevel;

    void Start()
    {
        progressTransform = upgradeProgress.GetComponent<RectTransform>();
    }

    public void Setup(int _key, string _shopItemName)
    {
        keyText.text = _key.ToString();
        itemNameText.text = _shopItemName;
        itemPriceText.text = "$10";

        shopItemLevel = 1;
        key = _key;
    }
    
    public void UpdateShop(int newLevel) {
        shopItemLevel = newLevel;

        itemPriceText.text = (newLevel < 10) ? ("$" + (newLevel * 10).ToString()) : ("max");
        progressTransform.sizeDelta = new Vector2(108f / 10f * newLevel, progressTransform.sizeDelta.y);
    }

    void Update()
    {

    }
}
