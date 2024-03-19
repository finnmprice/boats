using UnityEngine;

public class Settings : MonoBehaviour
{
    public static Settings instance;

    public void Awake() { instance = this; }

    [Header("Refs")]
    public GameObject coinPrefab;
    public GameObject projectilePrefab;
    public GameObject shopItemPrefab;

    [Space]
    [Header("Containers")]
    public Transform projectileContainer;
    public Transform coinContainer;
    public Transform shopParent;

    [Space]
    [Header("Shop")]
    public ShopItem[] shopItems;
}

[System.Serializable]
public class ShopItem
{
    public int key;
    public string name;
    public int level;

    public ShopItem(int _key, string _name, int _level)
    {
        key = _key;
        name = _name;
        level = _level;
    }
}