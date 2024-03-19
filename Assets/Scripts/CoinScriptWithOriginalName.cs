using UnityEngine;

public class CoinScriptWithOriginalName : MonoBehaviour
{
    void OnTriggerEnter2D(Collider2D other)
    {
        if (other.CompareTag("Player"))
        {
            PlayerController playerController = other.GetComponent<PlayerController>();
            if (playerController != null)
            {
                playerController.IncreaseCoins(20f);
                Destroy(gameObject);
            }
        }
    }
}
