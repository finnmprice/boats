using UnityEngine;

public class PlayerController : MonoBehaviour
{
    [SerializeField] float rotationSpeed = 5f;
    [SerializeField] float movementMultiplier = 2f;
    [SerializeField] GameObject projectilePrefab;
    [SerializeField] Transform leftFirePoint;
    [SerializeField] Transform rightFirePoint;
    [SerializeField] float projectileSpeed = 2f;
    Rigidbody2D rb;

    void Start()
    {
        rb = GetComponent<Rigidbody2D>();
    }

    void Update()
    {
        RotatePlayer();

        // Check for mouse click
        if (Input.GetMouseButtonDown(0))
        {
            FireProjectiles();
        }
    }

    void FixedUpdate()
    {
        MovePlayer();
    }

    void RotatePlayer()
    {
        GameObject playerSprite = GameObject.Find("Sprite");
        Vector3 mousePosition = Input.mousePosition;
        Vector3 mouseWorldPosition = Camera.main.ScreenToWorldPoint(mousePosition);

        Vector2 direction = new Vector2(mouseWorldPosition.x - playerSprite.transform.position.x, mouseWorldPosition.y - playerSprite.transform.position.y);

        float angleRadians = Mathf.Atan2(direction.y, direction.x);
        float angleDegrees = angleRadians * Mathf.Rad2Deg;
        Quaternion rotation = Quaternion.Euler(new Vector3(0f, 0f, angleDegrees));
        playerSprite.transform.rotation = Quaternion.Slerp(playerSprite.transform.rotation, rotation, rotationSpeed * Time.deltaTime);
    }

    void MovePlayer()
    {
        float horizontalAxis = Input.GetAxis("Horizontal");
        float verticalAxis = Input.GetAxis("Vertical");

        Vector2 movement = new Vector2(horizontalAxis, verticalAxis) * movementMultiplier * Time.fixedDeltaTime;
        rb.MovePosition(rb.position + movement);
    }

    void FireProjectiles()
    {
        GameObject leftProjectile = Instantiate(projectilePrefab, leftFirePoint.position, Quaternion.identity);
        Rigidbody2D leftRigidbody = leftProjectile.GetComponent<Rigidbody2D>();
        leftRigidbody.velocity = leftFirePoint.right * projectileSpeed;

        GameObject rightProjectile = Instantiate(projectilePrefab, rightFirePoint.position, Quaternion.identity);
        Rigidbody2D rightRigidbody = rightProjectile.GetComponent<Rigidbody2D>();
        rightRigidbody.velocity = rightFirePoint.right * projectileSpeed;
    }

}
