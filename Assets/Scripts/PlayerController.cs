using UnityEngine;
using TMPro;

public class PlayerController : MonoBehaviour
{
    [SerializeField] float rotationSpeed = 5f; // deg / second
    [SerializeField] float moveSpeed = 2f;
    [SerializeField] Transform leftFirePoint;
    [SerializeField] Transform rightFirePoint;
    [SerializeField] float projectileSpeed = 2f;
    [SerializeField] float projectileTime = 2f;
    [SerializeField] GameObject position;
    [SerializeField] GameObject UI;
    private int[] shopLevels = new int[] { 1, 1, 1, 1, 1, 1, 1 };
    private Rigidbody2D rb;
    private GameObject playerSprite;
    private float coins = 0f;
    private TextMeshProUGUI coinsText;

    void Start()
    {
        rb = GetComponent<Rigidbody2D>();
        GameObject coinsCanvas = GameObject.Find("Coins");
        coinsText = coinsCanvas.GetComponentInChildren<TextMeshProUGUI>();

        playerSprite = GameObject.Find("Sprite");
    }

    void Update()
    {
        RotatePlayer();

        UpdateMinimap();

        if (Input.GetMouseButtonDown(0))
        {
            FireProjectiles();
        }

        for (int i = 0; i < shopLevels.Length; i++)
        {
            if (Input.GetKeyDown(KeyCode.Alpha1 + i) && shopLevels[i] < 10)
            {
                shopLevels[i]++;
                ShopController.instance.UpdateShopItem(i + 1, shopLevels[i]);
                Debug.Log("level of shop " + (i + 1) + " increased to " + shopLevels[i]);
            }
        }
    }

    void FixedUpdate()
    {
        MovePlayer();
    }

    void RotatePlayer()
    {
        float rotationAmount = 0f;

        if (Input.GetKey(KeyCode.A))
        {
            rotationAmount += rotationSpeed * Time.deltaTime;
        }
        if (Input.GetKey(KeyCode.D))
        {
            rotationAmount -= rotationSpeed * Time.deltaTime;
        }
        playerSprite.transform.Rotate(Vector3.forward, rotationAmount);
    }


    void MovePlayer()
    {
        rb.velocity = playerSprite.transform.right * moveSpeed;
    }


    void FireProjectiles()
    {
        GameObject leftProjectile = Instantiate(Settings.instance.projectilePrefab, leftFirePoint.position, Quaternion.identity, Settings.instance.projectileContainer);
        Rigidbody2D leftRigidbody = leftProjectile.GetComponent<Rigidbody2D>();
        leftRigidbody.velocity = leftFirePoint.up * projectileSpeed;

        GameObject rightProjectile = Instantiate(Settings.instance.projectilePrefab, rightFirePoint.position, Quaternion.identity, Settings.instance.projectileContainer);
        Rigidbody2D rightRigidbody = rightProjectile.GetComponent<Rigidbody2D>();
        rightRigidbody.velocity = -rightFirePoint.up * projectileSpeed;

        Destroy(leftProjectile, projectileTime);
        Destroy(rightProjectile, projectileTime);
    }

    void UpdateMinimap() {
        if (rb != null && position != null) {
            float x = (rb.position.x + 50f) / 50 - 1;
            float y = (rb.position.y + 50f) / 50 - 1;
            position.transform.localPosition = new Vector3(x * 37.5f - 37.5f, y * 37.5f + 37.5f, position.transform.localPosition.z);
        }
    }

    public void IncreaseCoins(float value) {
        coins += value;
        coinsText.text = "$" + coins;
    }
}
