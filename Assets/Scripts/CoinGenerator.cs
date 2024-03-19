using UnityEngine;

public class CoinGenerator : MonoBehaviour
{
    public int numberOfCoins = 100;
    public float minX = -50f;
    public float maxX = 50f;
    public float minY = -50f;
    public float maxY = 50f;

    void Start()
    {
        GenerateCoins(numberOfCoins);
    }

    void GenerateCoins(int coins)
    {
        for (int i = 0; i < coins; i++)
        {
            float randomX = Random.Range(minX, maxX);
            float randomY = Random.Range(minY, maxY);

            GameObject coin = Instantiate(Settings.instance.coinPrefab, new Vector3(randomX, randomY, 0f), Quaternion.identity);
            coin.name = "Coin";
        }
    }
}
