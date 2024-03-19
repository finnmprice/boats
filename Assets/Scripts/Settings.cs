using UnityEngine;

public class Settings : MonoBehaviour
{
    public static Settings instance;

    public void Awake() { instance = this; }
    
    [Header("Refs")]
    public GameObject coinPrefab;
    public GameObject projectilePrefab;

    [Space]
    [Header("Containers")]
    public Transform projectileContainer;
}
